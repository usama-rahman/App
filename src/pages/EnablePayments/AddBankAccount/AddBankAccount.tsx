import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import ChooseMethod from '@pages/EnablePayments/AddBankAccount/SetupMethod';
import Confirmation from '@pages/EnablePayments/AddBankAccount/substeps/Confirmation';
import Plaid from '@pages/EnablePayments/AddBankAccount/substeps/Plaid';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalBankAccount, PlaidData} from '@src/types/onyx';

type AddPersonalBankAccountPageWithOnyxProps = {
    /** The details about the Personal bank account we are adding saved in Onyx */
    personalBankAccount: OnyxEntry<PersonalBankAccount>;
};

const plaidSubsteps: Array<React.ComponentType<SubStepProps>> = [Plaid, Confirmation];

function AddBankAccount({personalBankAccount, plaidData, userWallet}: AddPersonalBankAccountPageWithOnyxProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const submit = useCallback(() => {}, []);

    const isSetupTypeChosen = userWallet?.subStep === CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID;

    useEffect(() => {
        if (plaidData?.bankName) {
            // moveTo(1);
        }
    }, [plaidData]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo} = useSubStep({bodyContent: plaidSubsteps, startFrom: 0, onFinished: submit});

    const exitFlow = useCallback(
        (shouldContinue = false) => {
            const exitReportID = personalBankAccount?.exitReportID;
            const onSuccessFallbackRoute = personalBankAccount?.onSuccessFallbackRoute ?? '';

            if (exitReportID) {
                Navigation.dismissModal(exitReportID);
            } else if (shouldContinue && onSuccessFallbackRoute) {
                PaymentMethods.continueSetup(onSuccessFallbackRoute);
            } else {
                Navigation.goBack(ROUTES.SETTINGS_WALLET);
            }
        },
        [personalBankAccount],
    );

    const handleBackButtonPress = () => {
        switch (true) {
            case screenIndex === 0:
                BankAccounts.clearPersonalBankAccount();
                break;
            case !isSetupTypeChosen:
                exitFlow();
                break;
            default:
                prevScreen();
                break;
        }
    };

    return (
        <ScreenWrapper
            testID={AddBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                onBackButtonPress={handleBackButtonPress}
                title={translate('walletPage.addBankAccount')}
            />
            {isSetupTypeChosen ? (
                <>
                    <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                        <InteractiveStepSubHeader
                            startStepIndex={0}
                            stepNames={CONST.WALLET.STEP_NAMES}
                        />
                    </View>
                    <SubStep
                        isEditing={isEditing}
                        onNext={nextScreen}
                        onMove={moveTo}
                    />
                </>
            ) : (
                <ChooseMethod />
            )}
        </ScreenWrapper>
    );
}

AddBankAccount.displayName = 'AddPersonalBankAccountPage';

export default withOnyx<AddPersonalBankAccountPageWithOnyxProps, AddPersonalBankAccountPageWithOnyxProps>({
    personalBankAccount: {
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    },
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
})(AddBankAccount);
