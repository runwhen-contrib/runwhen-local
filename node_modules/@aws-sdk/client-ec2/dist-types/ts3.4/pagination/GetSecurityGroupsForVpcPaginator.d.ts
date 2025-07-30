import { Paginator } from "@smithy/types";
import {
  GetSecurityGroupsForVpcCommandInput,
  GetSecurityGroupsForVpcCommandOutput,
} from "../commands/GetSecurityGroupsForVpcCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateGetSecurityGroupsForVpc: (
  config: EC2PaginationConfiguration,
  input: GetSecurityGroupsForVpcCommandInput,
  ...rest: any[]
) => Paginator<GetSecurityGroupsForVpcCommandOutput>;
