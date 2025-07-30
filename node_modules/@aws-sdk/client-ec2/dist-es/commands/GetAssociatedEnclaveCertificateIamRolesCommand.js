import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_GetAssociatedEnclaveCertificateIamRolesCommand, se_GetAssociatedEnclaveCertificateIamRolesCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class GetAssociatedEnclaveCertificateIamRolesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetAssociatedEnclaveCertificateIamRoles", {})
    .n("EC2Client", "GetAssociatedEnclaveCertificateIamRolesCommand")
    .f(void 0, void 0)
    .ser(se_GetAssociatedEnclaveCertificateIamRolesCommand)
    .de(de_GetAssociatedEnclaveCertificateIamRolesCommand)
    .build() {
}
