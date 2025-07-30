import { Paginator } from "@smithy/types";
import {
  GetIpamPoolAllocationsCommandInput,
  GetIpamPoolAllocationsCommandOutput,
} from "../commands/GetIpamPoolAllocationsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetIpamPoolAllocations: (
  config: EC2PaginationConfiguration,
  input: GetIpamPoolAllocationsCommandInput,
  ...rest: any[]
) => Paginator<GetIpamPoolAllocationsCommandOutput>;
