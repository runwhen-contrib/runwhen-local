import { Paginator } from "@smithy/types";
import { GetTransitGatewayPolicyTableAssociationsCommandInput, GetTransitGatewayPolicyTableAssociationsCommandOutput } from "../commands/GetTransitGatewayPolicyTableAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetTransitGatewayPolicyTableAssociations: (config: EC2PaginationConfiguration, input: GetTransitGatewayPolicyTableAssociationsCommandInput, ...rest: any[]) => Paginator<GetTransitGatewayPolicyTableAssociationsCommandOutput>;
