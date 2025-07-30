import { Paginator } from "@smithy/types";
import {
  GetIpamDiscoveredResourceCidrsCommandInput,
  GetIpamDiscoveredResourceCidrsCommandOutput,
} from "../commands/GetIpamDiscoveredResourceCidrsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetIpamDiscoveredResourceCidrs: (
  config: EC2PaginationConfiguration,
  input: GetIpamDiscoveredResourceCidrsCommandInput,
  ...rest: any[]
) => Paginator<GetIpamDiscoveredResourceCidrsCommandOutput>;
