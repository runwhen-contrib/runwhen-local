import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeDBClusterAutomatedBackupsCommand, se_DescribeDBClusterAutomatedBackupsCommand, } from "../protocols/Aws_query";
export { $Command };
export class DescribeDBClusterAutomatedBackupsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeDBClusterAutomatedBackups", {})
    .n("RDSClient", "DescribeDBClusterAutomatedBackupsCommand")
    .f(void 0, void 0)
    .ser(se_DescribeDBClusterAutomatedBackupsCommand)
    .de(de_DescribeDBClusterAutomatedBackupsCommand)
    .build() {
}
