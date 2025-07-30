import { Paginator } from "@smithy/types";
import {
  GetVpnConnectionDeviceTypesCommandInput,
  GetVpnConnectionDeviceTypesCommandOutput,
} from "../commands/GetVpnConnectionDeviceTypesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetVpnConnectionDeviceTypes: (
  config: EC2PaginationConfiguration,
  input: GetVpnConnectionDeviceTypesCommandInput,
  ...rest: any[]
) => Paginator<GetVpnConnectionDeviceTypesCommandOutput>;
