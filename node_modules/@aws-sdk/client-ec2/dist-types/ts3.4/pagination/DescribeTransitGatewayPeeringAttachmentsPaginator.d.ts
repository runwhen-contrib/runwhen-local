import { Paginator } from "@smithy/types";
import {
  DescribeTransitGatewayPeeringAttachmentsCommandInput,
  DescribeTransitGatewayPeeringAttachmentsCommandOutput,
} from "../commands/DescribeTransitGatewayPeeringAttachmentsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeTransitGatewayPeeringAttachments: (
  config: EC2PaginationConfiguration,
  input: DescribeTransitGatewayPeeringAttachmentsCommandInput,
  ...rest: any[]
) => Paginator<DescribeTransitGatewayPeeringAttachmentsCommandOutput>;
