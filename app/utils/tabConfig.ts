import BankDetails from "~/components/Profile/settings/BankDetails.vue"
import PersonalDetails from "~/components/Profile/settings/PersonalDetails.vue"
import ProfilePicture from "~/components/Profile/settings/ProfilePicture.vue"
import UpdatePassword from "~/components/Profile/settings/UpdatePassword.vue"


export interface TabConfig {
    name: string
    component: any
}

export const tabs: TabConfig[] = [
    { name: 'Personal Details', component: PersonalDetails },
    { name: 'Bank Details', component: BankDetails },
    { name: 'Update Password', component: UpdatePassword },
    { name: 'Profile Picture', component: ProfilePicture },
]
