import { Paginator } from "@smithy/types";
import {
  DescribePrefixListsCommandInput,
  DescribePrefixListsCommandOutput,
} from "../commands/DescribePrefixListsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribePrefixLists: (
  config: EC2PaginationConfiguration,
  input: DescribePrefixListsCommandInput,
  ...rest: any[]
) => Paginator<DescribePrefixListsCommandOutput>;
