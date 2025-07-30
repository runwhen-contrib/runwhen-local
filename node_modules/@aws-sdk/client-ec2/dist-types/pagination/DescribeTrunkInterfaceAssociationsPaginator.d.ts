import { Paginator } from "@smithy/types";
import { DescribeTrunkInterfaceAssociationsCommandInput, DescribeTrunkInterfaceAssociationsCommandOutput } from "../commands/DescribeTrunkInterfaceAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeTrunkInterfaceAssociations: (config: EC2PaginationConfiguration, input: DescribeTrunkInterfaceAssociationsCommandInput, ...rest: any[]) => Paginator<DescribeTrunkInterfaceAssociationsCommandOutput>;
