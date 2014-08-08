require 'nokogiri'
require 'open-uri'
require 'sinatra'

set :sessions, true

get '/' do
  File.read(File.join('public/app', 'index.html'))
end


