import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribePrefixListsCommand, se_DescribePrefixListsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DescribePrefixListsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribePrefixLists", {})
    .n("EC2Client", "DescribePrefixListsCommand")
    .f(void 0, void 0)
    .ser(se_DescribePrefixListsCommand)
    .de(de_DescribePrefixListsCommand)
    .build() {
}
