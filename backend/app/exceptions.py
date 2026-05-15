from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    def __init__(self, status_code: int = 500, detail: str = "An unexpected error occurred"):
        self.status_code = status_code
        self.detail = detail
        super().__init__(detail)


class NotFoundException(AppException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=404, detail=detail)


class ValidationException(AppException):
    def __init__(self, detail: str = "Validation error"):
        super().__init__(status_code=422, detail=detail)


class DatabaseException(AppException):
    def __init__(self, detail: str = "Database error"):
        super().__init__(status_code=500, detail=detail)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    import logging
    logging.getLogger(__name__).error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": str(exc),
            "status_code": 500,
        },
    )
