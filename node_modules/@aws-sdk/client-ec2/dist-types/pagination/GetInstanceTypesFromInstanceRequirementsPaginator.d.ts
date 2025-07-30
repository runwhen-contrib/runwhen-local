import { Paginator } from "@smithy/types";
import { GetInstanceTypesFromInstanceRequirementsCommandInput, GetInstanceTypesFromInstanceRequirementsCommandOutput } from "../commands/GetInstanceTypesFromInstanceRequirementsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetInstanceTypesFromInstanceRequirements: (config: EC2PaginationConfiguration, input: GetInstanceTypesFromInstanceRequirementsCommandInput, ...rest: any[]) => Paginator<GetInstanceTypesFromInstanceRequirementsCommandOutput>;
