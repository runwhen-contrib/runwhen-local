import { Paginator } from "@smithy/types";
import {
  GetManagedPrefixListAssociationsCommandInput,
  GetManagedPrefixListAssociationsCommandOutput,
} from "../commands/GetManagedPrefixListAssociationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetManagedPrefixListAssociations: (
  config: EC2PaginationConfiguration,
  input: GetManagedPrefixListAssociationsCommandInput,
  ...rest: any[]
) => Paginator<GetManagedPrefixListAssociationsCommandOutput>;
