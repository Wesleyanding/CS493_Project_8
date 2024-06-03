/*
 * API sub-router for photos collection endpoints.
 */

const multer = require('multer');
const { Router } = require('express');
const path = require('path');

const { validateAgainstSchema } = require('../lib/validation')

const {
  PhotoSchema,
  removeUpload,
  insertNewPhoto,
  getPhotoById,
  checkMimeType,
  producer,
} = require('../models/photo')

const router = Router()

const photoUpload = multer({'dest': `${__dirname}/cs493_project8_uploads`})

/*
 * POST /photos - Route to create a new photo.
 */
router.post('/', photoUpload.single('image'), async (req, res) => {
  metadata = JSON.parse(req.body.metadata)

  if (validateAgainstSchema(req.body, PhotoSchema) && checkMimeType(req.file)) {
    try {
      const id = await insertNewPhoto(req.body);
      removeUpload(req.file);
      await producer(id)
      res.status(201).send({
        id: id,
        links: {
          photo: `/photos/${id}`,
          thumb: `/media/thumbs/${id}/`,
          business: `/businesses/${req.body.businessId}`,
          filename: `${req.file.filename}`,
          originalFilename: `${req.file.originalname}`
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    })
  }
})

/*
 * GET /photos/{id} - Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await getPhotoById(req.params.id)
    if (photo) {
      res.setHeader('Content-Type', photo.metadata.contentType);
      const photoResult = {
        photo: photo,
        thumb: `/media/thumbs/${req.params.id}.jpg`
      }
      res.status(200).send(photoResult)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
