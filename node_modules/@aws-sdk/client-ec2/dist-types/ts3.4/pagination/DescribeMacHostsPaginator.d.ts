import { Paginator } from "@smithy/types";
import {
  DescribeMacHostsCommandInput,
  DescribeMacHostsCommandOutput,
} from "../commands/DescribeMacHostsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeMacHosts: (
  config: EC2PaginationConfiguration,
  input: DescribeMacHostsCommandInput,
  ...rest: any[]
) => Paginator<DescribeMacHostsCommandOutput>;
