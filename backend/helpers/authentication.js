import jwt from 'jsonwebtoken';


export const generateTokens = (userId) => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
  }

  const accessToken = jwt.sign({userId} , ACCESS_TOKEN_SECRET , {
    expiresIn: '1year' 
  })

  return { accessToken } 
}


export const setCookies = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'Strict', // Adjust as necessary for your application
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
  }
    )
}