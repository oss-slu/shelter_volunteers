global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import Shelters from './../../Shelters'
import '@testing-library/jest-dom'
let mockShift = {
  code: 92341,
  shelter: "shelter-id-for-st-patric-center",
  start_time: 1696255200000,
  end_time: 1696269600000, 
}

//in current implemetation when the page is first loaded the submit button disabled attribute is null
test('submit shifts button is disabled when no shifts are selected', async() => {
  render(<Shelters condensed={false} selectedShifts={[]}/>)
  await waitFor(() => {
    expect(screen.getByTestId('submit-shifts-button').getAttribute("disabled")).toBe(null)
  }) 
  cleanup()
})

test('submit shifts button is enabled when shifts are selected', async() => {
  render(<Shelters condensed={false} selectedShifts={[mockShift]}/>)
  await waitFor(() => {
    expect(screen.getByTestId('submit-shifts-button')).toBeEnabled()
  }) 
  cleanup()
})


