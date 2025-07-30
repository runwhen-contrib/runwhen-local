import { Paginator } from "@smithy/types";
import { GetTransitGatewayPrefixListReferencesCommandInput, GetTransitGatewayPrefixListReferencesCommandOutput } from "../commands/GetTransitGatewayPrefixListReferencesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetTransitGatewayPrefixListReferences: (config: EC2PaginationConfiguration, input: GetTransitGatewayPrefixListReferencesCommandInput, ...rest: any[]) => Paginator<GetTransitGatewayPrefixListReferencesCommandOutput>;
