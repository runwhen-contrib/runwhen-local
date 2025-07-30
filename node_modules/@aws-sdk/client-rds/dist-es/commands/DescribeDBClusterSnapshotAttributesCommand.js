import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeDBClusterSnapshotAttributesCommand, se_DescribeDBClusterSnapshotAttributesCommand, } from "../protocols/Aws_query";
export { $Command };
export class DescribeDBClusterSnapshotAttributesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeDBClusterSnapshotAttributes", {})
    .n("RDSClient", "DescribeDBClusterSnapshotAttributesCommand")
    .f(void 0, void 0)
    .ser(se_DescribeDBClusterSnapshotAttributesCommand)
    .de(de_DescribeDBClusterSnapshotAttributesCommand)
    .build() {
}
