"""
Test Lambda for RunWhen discovery testing.
Lists objects in the discovery test S3 bucket (if any) and returns context.
"""
import json
import os
import boto3


def handler(event, context):
    bucket_name = os.environ.get("DISCOVERY_BUCKET", "")
    result = {
        "source": "runwhen-irsa-eks-discovery-test",
        "bucket": bucket_name,
        "object_count": 0,
        "request_id": getattr(context, "aws_request_id", "local"),
    }
    if bucket_name:
        try:
            s3 = boto3.client("s3")
            resp = s3.list_objects_v2(Bucket=bucket_name, MaxKeys=10)
            result["object_count"] = resp.get("KeyCount", 0)
        except Exception as e:
            result["error"] = str(e)
    return {"statusCode": 200, "body": json.dumps(result)}
