import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeGlobalClustersCommand, se_DescribeGlobalClustersCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeGlobalClustersCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeGlobalClusters", {})
    .n("RDSClient", "DescribeGlobalClustersCommand")
    .f(void 0, void 0)
    .ser(se_DescribeGlobalClustersCommand)
    .de(de_DescribeGlobalClustersCommand)
    .build() {
}
