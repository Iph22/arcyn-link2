import { NextRequest, NextResponse } from 'next/server'
import { RtcTokenBuilder, RtcRole } from 'agora-access-token'

export async function POST(request: NextRequest) {
  try {
    const { channelName, uid } = await request.json()

    if (!channelName) {
      return NextResponse.json(
        { error: 'Channel name is required' },
        { status: 400 }
      )
    }

    const appId = process.env.AGORA_APP_ID
    const appCertificate = process.env.AGORA_APP_CERTIFICATE

    if (!appId || !appCertificate) {
      return NextResponse.json(
        { error: 'Agora credentials not configured' },
        { status: 500 }
      )
    }

    // Generate a unique UID if not provided
    const userUid = uid || Math.floor(Math.random() * 100000)

    // Token expires in 24 hours
    const expirationTimeInSeconds = 3600 * 24
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

    // Build token with publisher role
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      userUid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    )

    return NextResponse.json({
      token,
      uid: userUid,
      appId,
      channelName,
      expiresAt: privilegeExpiredTs,
    })
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating Agora token:', error)
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate token' },
      { status: 500 }
    )
  }
}
