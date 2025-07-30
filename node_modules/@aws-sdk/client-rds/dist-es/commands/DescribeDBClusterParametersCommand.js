import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeDBClusterParametersCommand, se_DescribeDBClusterParametersCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeDBClusterParametersCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeDBClusterParameters", {})
    .n("RDSClient", "DescribeDBClusterParametersCommand")
    .f(void 0, void 0)
    .ser(se_DescribeDBClusterParametersCommand)
    .de(de_DescribeDBClusterParametersCommand)
    .build() {
}
