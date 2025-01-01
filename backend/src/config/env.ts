// provide typing to ConfigService
export type Config = {
  PORT: number
}

// do all conversions and validations here
export default () => ({
  PORT: parseInt(process.env.PORT, 10) || 3000,
})
