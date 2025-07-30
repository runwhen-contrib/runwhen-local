import { Paginator } from "@smithy/types";
import { GetTransitGatewayAttachmentPropagationsCommandInput, GetTransitGatewayAttachmentPropagationsCommandOutput } from "../commands/GetTransitGatewayAttachmentPropagationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetTransitGatewayAttachmentPropagations: (config: EC2PaginationConfiguration, input: GetTransitGatewayAttachmentPropagationsCommandInput, ...rest: any[]) => Paginator<GetTransitGatewayAttachmentPropagationsCommandOutput>;
