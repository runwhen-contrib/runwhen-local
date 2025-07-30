import { Paginator } from "@smithy/types";
import { DescribeTransitGatewayAttachmentsCommandInput, DescribeTransitGatewayAttachmentsCommandOutput } from "../commands/DescribeTransitGatewayAttachmentsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeTransitGatewayAttachments: (config: EC2PaginationConfiguration, input: DescribeTransitGatewayAttachmentsCommandInput, ...rest: any[]) => Paginator<DescribeTransitGatewayAttachmentsCommandOutput>;
