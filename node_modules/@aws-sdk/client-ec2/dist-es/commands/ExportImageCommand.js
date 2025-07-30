import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ExportImageCommand, se_ExportImageCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ExportImageCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ExportImage", {})
    .n("EC2Client", "ExportImageCommand")
    .f(void 0, void 0)
    .ser(se_ExportImageCommand)
    .de(de_ExportImageCommand)
    .build() {
}
