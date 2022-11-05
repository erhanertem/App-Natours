class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //mongoose model data object --> Tour.find() for daisy chaining queries
    /* //VERY IMPORTANT
The Model.find() function returns an instance of Mongoose's Query class. The Query class represents a raw CRUD operation that you may send to MongoDB. It provides a chainable interface for building up more sophisticated queries. You don't instantiate a Query directly, Customer.find() instantiates one for you.
    */
    /* //VERY IMPORTANT
So, the APIFeatures class expects a mongoose query object as an input. The way we create a query object is by creating a query with Tour.find(), but not executing the query right away, so not using await on it (in case we're using async/await like we do in the course). Again, by doing this, we end up with a query object onto which we can then chain other methods, such as sort, or another find, as you posted in your example: this.query.find(JSON.parse(queryStr))
Keep in mind that here, inside the class, this.query is the query object we created in the beginning, so it's like having: Tour.find().find(JSON.parse(queryStr))
And yes, that is totally acceptable. Again, because the query has not yet executed, it didn't return the actual results yet. That's what we do in the end, which is the reason why in the end we have to use
const tours = await features.query;
   */

    this.queryString = queryString; //i.e. 127.0.0.1:3000/api/v1/tours?fields=name ---> req.query is the {fields: 'name'}
  }

  filter() {
    //#1A.Primary off-scope Filtering
    const queryObj = { ...this.queryString }; //Create a shallow copy of the query object
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    //#1B.Secondary Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this; //we return the object to use them in  daisy-chain of these methods
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this; //we return the object to use them in  daisy-chain of these methods
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //exclude this field - mongoDB by default internally uses this __v field for its operations which is of no use to end-user.
    }
    return this; //we return the object to use them in  daisy-chain of these methods
  }

  paginate() {
    //127.0.0.1:3000/api/v1/tours?page=2&limit=10 --> page 1 (1-10) , page 2 (11-20), page 3 (21-30)
    const page = +this.queryString.page || 1; //we stringfy the number input for the page query property or declare default
    const limit = +this.queryString.limit || 100; //we stringfy the number input for the limit query property or declare default
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
