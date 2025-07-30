import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeDBShardGroupsCommand, se_DescribeDBShardGroupsCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeDBShardGroupsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeDBShardGroups", {})
    .n("RDSClient", "DescribeDBShardGroupsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeDBShardGroupsCommand)
    .de(de_DescribeDBShardGroupsCommand)
    .build() {
}
