import { Paginator } from "@smithy/types";
import {
  GetIpamDiscoveredAccountsCommandInput,
  GetIpamDiscoveredAccountsCommandOutput,
} from "../commands/GetIpamDiscoveredAccountsCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetIpamDiscoveredAccounts: (
  config: EC2PaginationConfiguration,
  input: GetIpamDiscoveredAccountsCommandInput,
  ...rest: any[]
) => Paginator<GetIpamDiscoveredAccountsCommandOutput>;
