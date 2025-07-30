import { Paginator } from "@smithy/types";
import { DescribeManagedPrefixListsCommandInput, DescribeManagedPrefixListsCommandOutput } from "../commands/DescribeManagedPrefixListsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateDescribeManagedPrefixLists: (config: EC2PaginationConfiguration, input: DescribeManagedPrefixListsCommandInput, ...rest: any[]) => Paginator<DescribeManagedPrefixListsCommandOutput>;
