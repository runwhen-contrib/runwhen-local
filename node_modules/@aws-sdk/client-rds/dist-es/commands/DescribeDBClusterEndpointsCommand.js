import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeDBClusterEndpointsCommand, se_DescribeDBClusterEndpointsCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeDBClusterEndpointsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeDBClusterEndpoints", {})
    .n("RDSClient", "DescribeDBClusterEndpointsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeDBClusterEndpointsCommand)
    .de(de_DescribeDBClusterEndpointsCommand)
    .build() {
}
