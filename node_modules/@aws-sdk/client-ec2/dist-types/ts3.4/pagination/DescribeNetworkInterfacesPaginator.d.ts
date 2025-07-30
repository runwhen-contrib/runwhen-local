import { Paginator } from "@smithy/types";
import {
  DescribeNetworkInterfacesCommandInput,
  DescribeNetworkInterfacesCommandOutput,
} from "../commands/DescribeNetworkInterfacesCommand";
import { EC2PaginationConfiguration } from "./Interfaces";
export declare const paginateDescribeNetworkInterfaces: (
  config: EC2PaginationConfiguration,
  input: DescribeNetworkInterfacesCommandInput,
  ...rest: any[]
) => Paginator<DescribeNetworkInterfacesCommandOutput>;
