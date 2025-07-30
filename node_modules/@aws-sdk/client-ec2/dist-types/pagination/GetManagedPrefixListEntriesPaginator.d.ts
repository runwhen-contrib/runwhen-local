import { Paginator } from "@smithy/types";
import { GetManagedPrefixListEntriesCommandInput, GetManagedPrefixListEntriesCommandOutput } from "../commands/GetManagedPrefixListEntriesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
/**
 * @public
 */
export declare const paginateGetManagedPrefixListEntries: (config: EC2PaginationConfiguration, input: GetManagedPrefixListEntriesCommandInput, ...rest: any[]) => Paginator<GetManagedPrefixListEntriesCommandOutput>;
