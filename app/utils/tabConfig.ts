import BankDetails from "~/components/Profile/Settings/BankDetails.vue"
import PersonalDetails from "~/components/Profile/Settings/PersonalDetails.vue"
import ProfilePicture from "~/components/Profile/Settings/ProfilePicture.vue"
import UpdatePassword from "~/components/Profile/Settings/UpdatePassword.vue"


export interface TabConfig {
    id: number,
    name: string
    component: any
}

export const tabs: TabConfig[] = [
    { id: 1, name: 'Personal Details', component: PersonalDetails },
    { id: 2, name: 'Bank Details', component: BankDetails },
    { id: 3, name: 'Update Password', component: UpdatePassword },
    // { id: 4, name: 'Profile Picture', component: ProfilePicture },
]
