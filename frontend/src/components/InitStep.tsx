import React, { useState } from 'react'
import { Box, Stepper, Step, StepLabel, Paper, Typography, Button } from '@material-ui/core'
interface Props {

}
const steps = [
    'Fill in your contract setting',
    'Upload metadata',
    'Finish setting',
];

function getStepContent(step: number) {
    switch (step) {
        case 0:
            return 'Select campaign settings...';
        case 1:
            return 'What is an ad group anyways?';
        case 2:
            return 'This is the bit I really care about!';
        default:
            return 'Unknown step';
    }
}

const InitStep: React.FC<Props> = () => {
    const [activeStep, setActiveStep] = useState(0);
    
    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };
    return (
        <Paper>
            <Box sx={{ width: '100%' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <div>
                    {activeStep === steps.length ? (
                        <div>
                            <Typography >All steps completed</Typography>
                            <Button onClick={handleReset}>Confirm</Button>
                        </div>
                    ) : (
                        <div>
                            <Typography >{getStepContent(activeStep)}</Typography>
                            <div>
                                <Button
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                >
                                    Back
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleNext}>
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Box>
        </Paper >
    )
}

export default InitStep
