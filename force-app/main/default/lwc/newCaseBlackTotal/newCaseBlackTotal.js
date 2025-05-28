import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NewCaseBlackTotal extends NavigationMixin(LightningElement) {
    navigateToNewCase() {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'formCaseBlackTotal'
            }
        });
    }
}