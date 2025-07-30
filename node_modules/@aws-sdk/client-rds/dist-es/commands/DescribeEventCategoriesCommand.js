import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DescribeEventCategoriesCommand, se_DescribeEventCategoriesCommand } from "../protocols/Aws_query";
export { $Command };
export class DescribeEventCategoriesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DescribeEventCategories", {})
    .n("RDSClient", "DescribeEventCategoriesCommand")
    .f(void 0, void 0)
    .ser(se_DescribeEventCategoriesCommand)
    .de(de_DescribeEventCategoriesCommand)
    .build() {
}
