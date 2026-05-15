import os
import sys
import uvicorn

# Ensure the backend directory is on the Python path
# so `app.main` resolves regardless of the working directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

if __name__ == "__main__":
    uvicorn.run("app.main:app", reload=True, host="0.0.0.0", port=8000)
