import { Paginator } from "@smithy/types";
import { DescribeIntegrationsCommandInput, DescribeIntegrationsCommandOutput } from "../commands/DescribeIntegrationsCommand";
import { RDSPaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeIntegrations: (config: RDSPaginationConfiguration, input: DescribeIntegrationsCommandInput, ...rest: any[]) => Paginator<DescribeIntegrationsCommandOutput>;
