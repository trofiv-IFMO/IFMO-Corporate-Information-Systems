import React from "react";
import _ from "underscore";
import XRegExp from "xregexp";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";
import FlatButton from "material-ui/FlatButton";
import RaisedButton from "material-ui/RaisedButton";
import AccountCircle from "material-ui/svg-icons/action/account-circle";
import Email from "material-ui/svg-icons/communication/email";
import Lock from "material-ui/svg-icons/action/lock";

//TODO timeout for components rendering according to the transform duration
//TODO WS API calls
//TODO Modals with information about wrong login, etc.
//TODO Perform main operation on Enter press
//TODO Short timeout between button tap and execution to watch animation

const Form = {
    LOGIN: 'login',
    SIGN_UP: 'sign-up',
    FORGOT_PASSWORD: 'forgot-password',
};

const emailPattern = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const usernamePattern = XRegExp('^[\\p{L}\\p{M}\\p{S}\\p{N}\\p{P}]{6,32}$');
const passwordPattern = /.{6,32}/;
const namePattern = XRegExp('^[\\p{L} .\'\-]{0,35}$');

const iconStyle = {
    position: 'relative',
    color: '#2c95dd',
    top: '10px',
    width: '30px',
    height: '30px',
    margin: '0 0 0 20px'
};

function validatePatterns(patterns, value) {
    return !(patterns && patterns.length > 0) || _.some(patterns, function (pattern) {
            return pattern.test(value);
        })
}

//noinspection FunctionWithMultipleReturnPointsJS
function validateField(patterns, value, customValidationFun, afterGeneralValidation) {
    if (customValidationFun === undefined) {
        return validatePatterns(patterns, value);
    } else {
        return afterGeneralValidation
            ? validatePatterns(patterns, value) && customValidationFun(value)
            : customValidationFun(value);
    }
}

function validateForm(instance) {
    return _.all(_.values(instance.constants.validation), function (obj) {
        return validateField(obj.patterns, instance.state[obj.stateField],
            obj.validationFunction, obj.afterGeneralValidation);
    });
}

class ValidTextField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorText: '',
            value: props.value
        }
    }

    onChange(event) {
        this.updateStateWithValue(event.target.value);
    }

    updateStateWithValue(value) {
        if (validateField(this.props.patterns, value,
                this.props.validationFunction,
                this.props.afterGeneralValidation)) {
            this.setState({...this.state, errorText: '', value: value});
        } else {
            this.setState({...this.state, errorText: this.props.errorText, value: value});
        }
        this.props.rootStateUpdater(value);
    }

    forceInvalidCheck() {
        this.updateStateWithValue(this.state.value);
    }

    errorStyle = {
        position: 'absolute',
        bottom: '-10px'
    };

    render() {
        return (
            <TextField
                className={this.props.className}
                hintText={this.props.hintText}
                onChange={this.onChange.bind(this)}
                errorText={this.state.errorText}
                errorStyle={this.errorStyle}
                type={this.props.type}
                value={this.state.value}
                floatingLabelText={this.props.floatingLabelText}
            />
        )
    }
}

export class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUsername: props.username,
            loginPassword: props.password,
        };

        this.constants = {
            validation: {
                username: {
                    patterns: [usernamePattern, emailPattern],
                    ref: 'username',
                    stateField: 'loginUsername',
                    hintText: 'Username / Email',
                    floatingLabelText: 'Username / Email',
                    errorText: 'Username must be 6-32 characters length / Invalid email'
                },
                password: {
                    patterns: [passwordPattern],
                    ref: 'password',
                    stateField: 'loginPassword',
                    hintText: 'Password',
                    floatingLabelText: 'Password',
                    errorText: 'Password must be 6-32 characters length'
                }
            }
        }
    }

    onLoginTouchTap = () => {
        if (validateForm(this, this.props.validationFunction, this.props.afterGeneralValidation)) {
            this.props.onLogin();
            //TODO login
        } else {
            const instance = this;
            _.each(
                _.values(instance.constants.validation), function (obj) {
                    return instance.refs[obj.ref].forceInvalidCheck();
                }
            )
        }
    };

    onForgotPasswordTouchTap = () => {
        this.props.rootStateUpdater('activeForm', Form.FORGOT_PASSWORD);
    };

    onSignUpTouchTap = () => {
        this.props.rootStateUpdater('activeForm', Form.SIGN_UP);
    };

    //noinspection JSMethodCanBeStatic
    render() {
        return (
            <div>
                <AccountCircle style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    ref={this.constants.validation.username.ref}
                    value={this.state.loginUsername}
                    hintText={this.constants.validation.username.hintText}
                    errorText={this.constants.validation.username.errorText}
                    floatingLabelText={this.constants.validation.username.floatingLabelText}
                    patterns={this.constants.validation.username.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, loginUsername: value});
                        this.props.rootStateUpdater(this.constants.validation.username.stateField, value)
                    }}
                />
                <Lock style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    ref={this.constants.validation.password.ref}
                    value={this.state.loginPassword}
                    hintText={this.constants.validation.password.hintText}
                    errorText={this.constants.validation.password.errorText}
                    floatingLabelText={this.constants.validation.password.floatingLabelText}
                    type='password'
                    patterns={this.constants.validation.password.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, loginPassword: value});
                        this.props.rootStateUpdater(this.constants.validation.password.stateField, value)
                    }}
                    rootStateProperty='loginPassword'
                />
                <RaisedButton
                    label='Login'
                    primary={true}
                    onTouchTap={this.onLoginTouchTap}
                    className='login-input button'/>
                <FlatButton
                    label='Forgot password'
                    onTouchTap={this.onForgotPasswordTouchTap}
                    className='login-input button small left'
                />
                <FlatButton
                    label='Sign up'
                    onTouchTap={this.onSignUpTouchTap}
                    className='login-input button small right'
                />
            </div>
        )
    }
}

export class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            signUpUsername: props.username,
            signUpEmail: props.email,
            signUpPassword: props.password,
            signUpPasswordAgain: props.passwordAgain,
            signUpFirstName: props.firstName,
            signUpLastName: props.lastName,
            signUpMiddleName: props.middleName
        };

        this.constants = {
            validation: {
                username: {
                    patterns: [usernamePattern],
                    ref: 'username',
                    stateField: 'signUpUsername',
                    hintText: 'Username',
                    floatingLabelText: 'Username',
                    errorText: 'Username must be 6-32 characters length and must be not email-like',
                    validationFunction: this.signUpUsernameValidation,
                    afterGeneralValidation: true
                },
                email: {
                    patterns: [emailPattern],
                    ref: 'email',
                    stateField: 'signUpEmail',
                    hintText: 'Email',
                    floatingLabelText: 'Email',
                    errorText: 'Invalid email'
                },
                password: {
                    patterns: [passwordPattern],
                    ref: 'password',
                    stateField: 'signUpPassword',
                    hintText: 'Password',
                    floatingLabelText: 'Password',
                    errorText: 'Password must be 6-32 characters length'
                },
                passwordAgain: {
                    patterns: [],
                    ref: 'passwordAgain',
                    stateField: 'signUpPasswordAgain',
                    hintText: 'Password again',
                    floatingLabelText: 'Password again',
                    errorText: 'Must be equal to the password',
                    validationFunction: this.signUpPasswordAgainValidation,
                    afterGeneralValidation: true
                },
                firstName: {
                    patterns: [namePattern],
                    ref: 'firstName',
                    stateField: 'signUpFirstName',
                    hintText: 'First name',
                    floatingLabelText: 'First name',
                    errorText: 'First name must be up to 35 characters length'
                },
                lastName: {
                    patterns: [namePattern],
                    ref: 'lastName',
                    stateField: 'signUpLastName',
                    hintText: 'Last name',
                    floatingLabelText: 'Last name',
                    errorText: 'Last name must be up to 35 characters length'
                },
                middleName: {
                    patterns: [namePattern],
                    ref: 'middleName',
                    stateField: 'signUpMiddleName',
                    hintText: 'Middle name',
                    floatingLabelText: 'Middle name',
                    errorText: 'Middle name must be up to 35 characters length'
                }
            }
        }
    }

    onForgotPasswordTouchTap = () => {
        this.props.rootStateUpdater('activeForm', Form.FORGOT_PASSWORD);
    };

    onLoginTouchTap = () => {
        this.props.rootStateUpdater('activeForm', Form.LOGIN);
    };

    onSignUpTouchTap = () => {
        if (validateForm(this)) {
            this.props.onLogin();
            //TODO sign up
        } else {
            const instance = this;
            _.each(
                _.values(instance.constants.validation), function (obj) {
                    return instance.refs[obj.ref].forceInvalidCheck();
                }
            )
        }
    };

    signUpUsernameValidation = (value) => {
        return !emailPattern.test(value);
    };

    signUpPasswordAgainValidation = (value) => {
        return this.refs[this.constants.validation.password.ref].state.value == value;
    };

    //noinspection JSMethodCanBeStatic
    render() {
        return (
            <div>
                <AccountCircle style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    ref={this.constants.validation.username.ref}
                    value={this.state.signUpUsername}
                    hintText={this.constants.validation.username.hintText}
                    errorText={this.constants.validation.username.errorText}
                    floatingLabelText={this.constants.validation.username.floatingLabelText}
                    patterns={this.constants.validation.username.patterns}
                    validationFunction={this.constants.validation.username.validationFunction}
                    afterGeneralValidation={this.constants.validation.username.afterGeneralValidation}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, signUpUsername: value});
                        this.props.rootStateUpdater(this.constants.validation.username.stateField, value)
                    }}
                />
                <Email style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    value={this.state.signUpEmail}
                    ref={this.constants.validation.email.ref}
                    hintText={this.constants.validation.email.hintText}
                    errorText={this.constants.validation.email.errorText}
                    floatingLabelText={this.constants.validation.email.floatingLabelText}
                    patterns={this.constants.validation.email.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, signUpEmail: value});
                        this.props.rootStateUpdater(this.constants.validation.email.stateField, value)
                    }}
                />
                <Lock style={iconStyle}/>
                <ValidTextField
                    type='password'
                    className='login-input'
                    value={this.state.signUpPassword}
                    ref={this.constants.validation.password.ref}
                    hintText={this.constants.validation.password.hintText}
                    errorText={this.constants.validation.password.errorText}
                    floatingLabelText={this.constants.validation.password.floatingLabelText}
                    patterns={this.constants.validation.password.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, signUpPassword: value});
                        this.props.rootStateUpdater(this.constants.validation.password.stateField, value)
                    }}
                />
                <Lock style={iconStyle}/>
                <ValidTextField
                    type='password'
                    className='login-input'
                    value={this.state.signUpPasswordAgain}
                    ref={this.constants.validation.passwordAgain.ref}
                    hintText={this.constants.validation.passwordAgain.hintText}
                    errorText={this.constants.validation.passwordAgain.errorText}
                    floatingLabelText={this.constants.validation.passwordAgain.floatingLabelText}
                    patterns={this.constants.validation.passwordAgain.patterns}
                    validationFunction={this.signUpPasswordAgainValidation}
                    afterGeneralValidation={true}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, signUpPasswordAgain: value});
                        this.props.rootStateUpdater(this.constants.validation.passwordAgain.stateField, value)
                    }}
                />
                <AccountCircle style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    value={this.state.signUpFirstName}
                    ref={this.constants.validation.firstName.ref}
                    hintText={this.constants.validation.firstName.hintText}
                    errorText={this.constants.validation.firstName.errorText}
                    floatingLabelText={this.constants.validation.firstName.floatingLabelText}
                    patterns={this.constants.validation.firstName.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, signUpFirstName: value});
                        this.props.rootStateUpdater(this.constants.validation.firstName.stateField, value)
                    }}
                />
                <AccountCircle style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    value={this.state.signUpLastName}
                    ref={this.constants.validation.lastName.ref}
                    hintText={this.constants.validation.lastName.hintText}
                    errorText={this.constants.validation.lastName.errorText}
                    floatingLabelText={this.constants.validation.lastName.floatingLabelText}
                    patterns={this.constants.validation.lastName.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, signUpLastName: value});
                        this.props.rootStateUpdater(this.constants.validation.lastName.stateField, value)
                    }}
                />
                <AccountCircle style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    value={this.state.signUpMiddleName}
                    ref={this.constants.validation.middleName.ref}
                    hintText={this.constants.validation.middleName.hintText}
                    errorText={this.constants.validation.middleName.errorText}
                    floatingLabelText={this.constants.validation.middleName.floatingLabelText}
                    patterns={this.constants.validation.middleName.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, signUpMiddleName: value});
                        this.props.rootStateUpdater(this.constants.validation.middleName.stateField, value)
                    }}
                />
                <RaisedButton
                    label='Sign up'
                    primary={true}
                    onTouchTap={this.onSignUpTouchTap}
                    className='login-input button'/>
                <FlatButton
                    label='Login'
                    onTouchTap={this.onLoginTouchTap}
                    className='login-input button small left'
                />
                <FlatButton
                    label='Reset password'
                    onTouchTap={this.onForgotPasswordTouchTap}
                    className='login-input button small right'
                />
            </div>
        )
    }
}

export class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            forgotPasswordUsername: props.username
        };

        this.constants = {
            validation: {
                username: {
                    patterns: [usernamePattern, emailPattern],
                    ref: 'username',
                    stateField: 'forgotPasswordUsername',
                    hintText: 'Username / Email',
                    floatingLabelText: 'Username / Email',
                    errorText: 'Username must be at least 6 characters length / Invalid email'
                }
            }
        }
    }

    onResetPasswordTouchTap = () => {
        if (validateForm(this, this.props.validationFunction, this.props.afterGeneralValidation)) {
            alert('reset');
            //TODO reset
        } else {
            const instance = this;
            _.each(
                _.values(instance.constants.validation), function (obj) {
                    return instance.refs[obj.ref].forceInvalidCheck();
                }
            )
        }
    };

    onLoginTouchTap = () => {
        this.props.rootStateUpdater('activeForm', Form.LOGIN);
    };

    onSignUpTouchTap = () => {
        this.props.rootStateUpdater('activeForm', Form.SIGN_UP);
    };

    //noinspection JSMethodCanBeStatic
    render() {
        return (
            <div>
                <AccountCircle style={iconStyle}/>
                <ValidTextField
                    className='login-input'
                    ref={this.constants.validation.username.ref}
                    value={this.state.forgotPasswordUsername}
                    hintText={this.constants.validation.username.hintText}
                    errorText={this.constants.validation.username.errorText}
                    floatingLabelText={this.constants.validation.username.floatingLabelText}
                    patterns={this.constants.validation.username.patterns}
                    rootStateUpdater={(value) => {
                        this.setState({...this.state, forgotPasswordUsername: value});
                        this.props.rootStateUpdater(this.constants.validation.username.stateField, value)
                    }}
                />
                <RaisedButton
                    label='Reset password'
                    primary={true}
                    onTouchTap={this.onResetPasswordTouchTap}
                    className='login-input button'/>
                <FlatButton
                    label='Login'
                    onTouchTap={this.onLoginTouchTap}
                    className='login-input button small left'
                />
                <FlatButton
                    label='Sign up'
                    onTouchTap={this.onSignUpTouchTap}
                    className='login-input button small right'
                />
            </div>
        )
    }
}

export default class WelcomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUsername: '',
            loginPassword: '',
            signUpUsername: '',
            signUpEmail: '',
            signUpPassword: '',
            signUpPasswordAgain: '',
            signUpAgain: '',
            signUpFirstName: '',
            signUpLastName: '',
            signUpMiddleName: '',
            forgotPasswordUsername: '',
            activeForm: Form.LOGIN
        };

        this.constants = {
            appTitle: 'ReservIO',
            formShadow: 5,
            forms: {
                login: {
                    formIndicator: Form.LOGIN,
                    viewElement: () => {
                        return <Login
                            onLogin={this.props.onLogin}
                            username={this.state.loginUsername}
                            password={this.state.loginPassword}
                            rootStateUpdater={(prop, value) => this.updateStateProperty(prop, value)}/>
                    }
                },
                signUp: {
                    formIndicator: Form.SIGN_UP,
                    viewElement: () => {
                        return <SignUp
                            onLogin={this.props.onLogin}
                            username={this.state.signUpUsername}
                            email={this.state.signUpEmail}
                            password={this.state.signUpPassword}
                            passwordAgain={this.state.signUpPasswordAgain}
                            firstName={this.state.signUpFirstName}
                            lastName={this.state.signUpLastName}
                            middleName={this.state.signUpMiddleName}
                            rootStateUpdater={(prop, value) => this.updateStateProperty(prop, value)}/>
                    }
                },
                forgotPassword: {
                    formIndicator: Form.FORGOT_PASSWORD,
                    viewElement: () => {
                        return <ForgotPassword
                            username={this.state.forgotPasswordUsername}
                            rootStateUpdater={(prop, value) => this.updateStateProperty(prop, value)}/>
                    }
                }
            }
        };
    }

    updateStateProperty(property, value) {
        this.state[property] = value;
        this.setState(this.state);
    }

    getCurrentViewElement = () => {
        const instance = this;

        return _.findWhere(
            _.map(
                _.keys(this.constants.forms), function (property) {
                    return instance.constants.forms[property];
                }
            ), {formIndicator: instance.state.activeForm}
        ).viewElement();
    };

    //noinspection JSMethodCanBeStatic
    render() {
        return (
            <div className='outer'>
                <div className='middle'>
                    <div className='inner'>
                        <Paper
                            rounded={false}
                            className={'login-paper ' + this.state.activeForm}
                            zDepth={this.constants.formShadow}>
                            <Paper
                                rounded={false}
                                className='login-header'
                                zDepth={0}>
                                <div className='login-logo'/>
                                <div className='login-title'>{this.constants.appTitle}</div>
                            </Paper>
                            {this.getCurrentViewElement()}
                        </Paper>
                    </div>
                </div>
            </div>
        )
    }
}