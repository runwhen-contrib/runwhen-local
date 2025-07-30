import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RemoveSourceIdentifierFromSubscriptionCommand, se_RemoveSourceIdentifierFromSubscriptionCommand, } from "../protocols/Aws_query";
export { $Command };
export class RemoveSourceIdentifierFromSubscriptionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RemoveSourceIdentifierFromSubscription", {})
    .n("RDSClient", "RemoveSourceIdentifierFromSubscriptionCommand")
    .f(void 0, void 0)
    .ser(se_RemoveSourceIdentifierFromSubscriptionCommand)
    .de(de_RemoveSourceIdentifierFromSubscriptionCommand)
    .build() {
}
