const { Router } = require('express');
const { getDatabaseReference } = require('../lib/mongo');
const { ObjectId } = require('mongodb');
const { GridFSBucket } = require('mongodb');
const router = Router();

router.get('/photos/:id.ext', async (req, res) => {
    const db = getDatabaseReference();
    const bucket = new GridFSBucket(db, { bucketName: 'photos' });

    try {
        const photo = await bucket.find({
            _id: new ObjectId(req.params.id)
        }).toArray();

        if (photo.length > 0) {
            res.status(200).type(photo[0].contentType).send(photo[0]);
            bucket.openDownloadStream(photo[0]._id).pipe(res);
        } else {
            res.status(404).send({
                error: "Requested photo does not exist"
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Error fetching photo.  Please try again later."
        });
    }
}
)

router.get('/thumbnails/:id.jpg', async (req, res) => {
    const db = getDatabaseReference();
    const bucket = new GridFSBucket(db, { bucketName: 'thumbnails' });

    try {
        const thumbnail = await bucket.find({
            _id: new ObjectId(req.params.id)
        }).toArray();

        if (thumbnail.length > 0) {
            res.status(200).type(thumbnail[0].contentType).send(thumbnail[0]);
            bucket.openDownloadStream(thumbnail[0]._id).pipe(res);
        } else {
            res.status(404).send({
                error: "Requested thumbnail does not exist"
            });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send({
            error: "Error fetching thumbnail.  Please try again later."
        });
    }
}
)

module.exports = router;
