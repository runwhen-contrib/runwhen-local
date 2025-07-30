import { Paginator } from "@smithy/types";
import {
  DescribeDhcpOptionsCommandInput,
  DescribeDhcpOptionsCommandOutput,
} from "../commands/DescribeDhcpOptionsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeDhcpOptions: (
  config: EC2PaginationConfiguration,
  input: DescribeDhcpOptionsCommandInput,
  ...rest: any[]
) => Paginator<DescribeDhcpOptionsCommandOutput>;
