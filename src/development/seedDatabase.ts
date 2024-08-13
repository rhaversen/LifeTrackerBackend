import TrackModel from '../app/models/Track.js'
import UserModel from '../app/models/User.js'
import logger from '../app/utils/logger.js'

logger.info('Seeding database')

const seeds = [
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-13T00:45:11.629+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-13T00:45:09.480+00:00'
    },
    {
        trackName: 'SEX',
        date: '2024-08-13T00:44:39.870+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-12T23:11:40.993+00:00'
    },
    {
        trackName: 'BLOW_NOSE',
        date: '2024-08-12T23:11:35.045+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-12T23:11:33.036+00:00'
    },
    {
        trackName: 'SHOWER',
        date: '2024-08-12T23:11:18.245+00:00'
    },
    {
        trackName: 'SEX',
        date: '2024-08-12T23:11:16.139+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-12T21:00:26.938+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-12T19:22:23.482+00:00'
    },
    {
        trackName: 'SHOWER',
        date: '2024-08-12T18:31:28.726+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-12T16:58:27.658+00:00'
    },
    {
        trackName: 'EXCRETED_FECES',
        date: '2024-08-12T16:30:31.947+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-12T16:30:29.439+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-12T14:39:02.271+00:00'
    },
    {
        trackName: 'BLOW_NOSE',
        date: '2024-08-12T13:40:48.050+00:00'
    },
    {
        trackName: 'SHOWER',
        date: '2024-08-12T13:39:25.834+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-12T13:02:39.654+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-12T08:39:46.632+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-12T04:05:29.484+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-12T02:45:54.040+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-12T01:51:36.523+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-12T00:57:17.662+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-11T22:29:30.552+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-11T21:09:19.027+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-11T18:58:09.607+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-11T18:38:53.057+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-11T17:14:32.041+00:00'
    },
    {
        trackName: 'CONSUMED_SNUFF',
        date: '2024-08-11T15:42:25.732+00:00'
    },
    {
        trackName: 'EXCRETED_FECES',
        date: '2024-08-11T14:55:55.101+00:00'
    },
    {
        trackName: 'EXCRETED_URINE',
        date: '2024-08-11T14:55:51.942+00:00'
    }
]

const user = await UserModel.create({
    userName: 'Rhaversen',
    email: 'Rhaversen@gmail.com',
    password: 'password'
})
await user.save()

for (const seed of seeds) {
    const newTrack = await TrackModel.create({
        trackName: seed.trackName,
        date: seed.date,
        userId: user._id
    })
    await newTrack.save()
}

logger.info('Database seeded')
