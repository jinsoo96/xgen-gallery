import tempfile
import os
import json
import subprocess
import sys
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["toolint"])


class ToolintRequest(BaseModel):
    code: str
    package_name: Optional[str] = "my_tool"


@router.post("/run")
async def run(req: ToolintRequest):
    try:
        with tempfile.TemporaryDirectory() as tmp_dir:
            pkg_dir = os.path.join(tmp_dir, req.package_name)
            os.makedirs(pkg_dir)

            # 패키지 구조 생성
            init_path = os.path.join(pkg_dir, "__init__.py")
            with open(init_path, "w", encoding="utf-8") as f:
                f.write(req.code)

            # pyproject.toml 생성
            pyproject = f"""[project]
name = "{req.package_name}"
version = "0.1.0"

[project.scripts]
{req.package_name} = "{req.package_name}.__main__:main"
"""
            with open(os.path.join(tmp_dir, "pyproject.toml"), "w") as f:
                f.write(pyproject)

            # toolint 실행
            result = subprocess.run(
                [sys.executable, "-m", "toolint", "check", ".", "--format", "json"],
                cwd=tmp_dir,
                capture_output=True,
                text=True,
                timeout=30,
            )

            output = result.stdout or result.stderr
            try:
                issues = json.loads(output) if output.strip() else []
            except json.JSONDecodeError:
                issues = [{"raw": output}]

            errors = [i for i in issues if isinstance(i, dict) and i.get("severity") == "error"]
            warnings = [i for i in issues if isinstance(i, dict) and i.get("severity") == "warning"]

            return {
                "issues": issues,
                "summary": f"{len(errors)} error(s), {len(warnings)} warning(s)",
                "passed": len(errors) == 0,
            }

    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Lint timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
