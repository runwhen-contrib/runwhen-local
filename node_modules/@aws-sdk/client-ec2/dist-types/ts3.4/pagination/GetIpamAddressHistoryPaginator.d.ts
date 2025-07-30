import { Paginator } from "@smithy/types";
import {
  GetIpamAddressHistoryCommandInput,
  GetIpamAddressHistoryCommandOutput,
} from "../commands/GetIpamAddressHistoryCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetIpamAddressHistory: (
  config: EC2PaginationConfiguration,
  input: GetIpamAddressHistoryCommandInput,
  ...rest: any[]
) => Paginator<GetIpamAddressHistoryCommandOutput>;
