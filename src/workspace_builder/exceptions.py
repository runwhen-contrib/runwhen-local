import json
import logging
import traceback

from rest_framework import views, status
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def handle(e, context):
    """
    Return a  response that has as much detail as practical to help debugging.

    Args:
      e (BaseException): The exception that caused the issue
      context (dict): A rich set of data (e.g. the view) given to us by the DRF framework for handling
    """
    next_exc = e
    stack_traces = []
    while next_exc:
        next_stack_trace = "\n".join(traceback.format_tb(next_exc.__traceback__))
        stack_traces.append(next_stack_trace)
        next_exc = next_exc.__cause__
    stack_trace = "\nCaused by:\n\n".join(stack_traces)

    try:
        # Call the DRF default exception handler first, and decorate the results.
        # The code below is DRF standard boilerplate
        response = views.exception_handler(e, context)
        if not response:
            response = Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        ed = dict()
        ed["drf"] = str(response)
        ed["message"] = f"{e}"
        ed["exceptionType"] = str(type(e))
        ed["stackTrace"] = stack_trace
        ed["context"] = str(context)
        # ed["originalRequestHeaders"] = context.get("request").headers
        ed["originalRequestData"] = context.get("request").data
        pw = ed.get("originalRequestData", {}).get("password")
        if pw:
            ed["originalRequestData"]["password"] = '*******'
        ed["originalRequestPath"] = context.get("request").path_info
        # ed["originalRequestBody"] = context.get("request").text
        # ed["originalRequestSession"] = context.get("request").session
        if response.data:
            if isinstance(response.data, dict):
                ed.update(response.data)
            else:
                ed["pd"] = response.data
        response.data = ed
        logger.debug(
            f"Error handling successful: type {type(e)}, "
            f"returning response {response} with data {json.dumps(response.data, indent=2)}, "
            f"stack trace {stack_trace}"
        )
        return response
    except Exception as exc:
        logger.warning(
            f"Error handling unsuccessful: type {type(e)}, "
            f"e: {str(e)} and stacktrace {stack_trace} with context {str(context)}"
        )
        logger.exception(exc)
        raise exc
