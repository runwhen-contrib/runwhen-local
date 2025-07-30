import { WaiterConfiguration, WaiterResult } from "@smithy/util-waiter";
import { DescribeVolumesCommandInput } from "../commands/DescribeVolumesCommand";
import { EC2Client } from "../EC2Client";
export declare const waitForVolumeDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVolumesCommandInput
) => Promise<WaiterResult>;
export declare const waitUntilVolumeDeleted: (
  params: WaiterConfiguration<EC2Client>,
  input: DescribeVolumesCommandInput
) => Promise<WaiterResult>;
